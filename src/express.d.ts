import "express-serve-static-core";
import { ObjectId } from "mongoose";

declare module "express-serve-static-core" {
        interface Request {
        user?: string;
        role?: "User" | "Admin";
        id?: ObjectId;
    }
}