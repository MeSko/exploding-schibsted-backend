import { sign, verify } from "jsonwebtoken";
import { Service } from "typedi";
import { JwtPayload } from "./JwtPayload";
import { AuthenticationError } from "apollo-server";

@Service()
export class AuthorizationService {
    public generateToken(payload: JwtPayload) {
        return sign(payload, String(process.env.JWT_SECRET));
    }

    public getPayload(token: string, expireTimeInDays = 30): JwtPayload {
        let payload;
        try {
            payload = verify(token, String(process.env.JWT_SECRET)) as JwtPayload;
        } catch (e) {
            throw new AuthenticationError("Invalid JWT token");
        }
        const nowInSeconds = Math.floor(Date.now() / 1000);

        if (!payload.iat) {
            throw new AuthenticationError("Token expired");
        }
        if (payload.iat + expireTimeInDays * 86400 < nowInSeconds) {
            throw new AuthenticationError("Token expired");
        }
        return payload;
    }
}
