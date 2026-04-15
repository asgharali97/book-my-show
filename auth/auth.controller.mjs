import pool from '../pool.mjs';
import { userSignupSchema, userLoginSchema } from './auth.validator.mjs';
import ApiError from '../utils/api-error.mjs';
import ApiResponse from '../utils/api-response.mjs';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.mjs';
import bcrypt from 'bcryptjs';


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
};

const signupUser = async (req, res) => {
    const { error, value } = userSignupSchema.validate(req.body)

    if (error) {
        const messages = error.details.map((d) => d.message).join(", ");
        throw ApiError.badRequest(messages);
    }

    const { name, password, email } = value;

    const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existingEmail.rowCount > 0) {
        throw ApiError.conflict("Email already registered")
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at
        `,
        [name, email, hashPassword]
    )

    const user = result.rows[0];

    const accessToken = generateAccessToken({ id: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user.id })

    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
        refreshToken,
        user.id,
    ]);

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.created(res, "User registered successfully", {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
        },
    }
    )
}


const loginUser = async (req, res) => {
    const { error, value } = userLoginSchema.validate(req.body);

    if (error) {
        const messages = error.details.map((d) => d.message).join(", ");
        throw ApiError.badRequest(messages);
    }

    const { email, password } = value

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (result.rowCount === 0) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized("Invalid email or password");
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user.id })

    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2",
        [refreshToken, user.id,]
    );

    res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.ok(res, "Login Successfully", {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
        }
    })
}

const logoutUser = async (req, res) => {
    await pool.query(
        "UPDATE users SET refresh_token = NULL WHERE id = $1",
        [req.user.id]
    );

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return ApiResponse.ok(res, "Logged out successfully", null);
};

export { signupUser, loginUser, logoutUser }