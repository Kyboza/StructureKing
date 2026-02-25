import User from "../database/models/user/user-model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { env } from "../validation/zod.config-server";
import { logError } from "../utils/logError";
import { loginSchema } from "../validation/zod-schemas";
import winstonLogger from "../utils/winstonLogger"; // Winston client
import type { Request, Response } from "express";

export async function loginUser(req: Request, res: Response): Promise<Response>{
    try {
        const parsed = loginSchema.safeParse(req.body);
        if(!parsed.success){
            winstonLogger.warn("Invalid login data");
            return res.status(400).json({ error: "Invalid data", success: false });
        }

        const { email, password, website } = parsed.data;

         if (website) {
            winstonLogger.warn("Honeypot triggered", { status: "honeypot" });
            return res.status(400).json({ error: "Could not sign in user", success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            winstonLogger.warn("User not found", { status: "not found" });
            return res.status(404).json({ error: "Could not sign in user", success: false });
        }

        const isPasswordValid = await bcrypt.compare(password + env.PEPPER_SECRET, user.password);
        if (!isPasswordValid) {
            winstonLogger.warn("Invalid password", { status: "invalid password" });
            return res.status(401).json({ error: "Could not sign in user", success: false });
        }

        const payload = {id: user._id, username: user.username, role: user.role};
        const token = jwt.sign(payload, env.JWT_SECRET, {expiresIn: "1d"});

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,   
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({message: "User logged in successfully", success: true});


    } catch(error){
        logError(error)
        winstonLogger.error("Server error during login", {error});
        return res.status(500).json({success: false, error: "Server Error"})
    }

}