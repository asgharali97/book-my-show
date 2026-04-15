import ApiError from "../utils/api-error.mjs";
import { verifyAccessToken } from "../utils/jwt.mjs";
import pool from "../pool.mjs";

const authenticate = async (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "")

    if(!token){
        throw ApiError.unauthorized("Access token missing");
    }

    const decodeToken = verifyAccessToken(token);

    const result = await pool.query(
        "SELECT id, name, email FROM users WHERE id = $1",
        [decodeToken.id]
    )

    if (result.rowCount === 0) {
        throw ApiError.unauthorized("User no longer exists");
    }

    req.user = result.rows[0];

    next();
};

export default authenticate