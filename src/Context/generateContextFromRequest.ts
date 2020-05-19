import { ContainerInstance } from "typedi";
import { AuthorizationService } from "../Authorization/AuthorizationService";
import { ExecutionParams } from "subscriptions-transport-ws";
import cookie from "cookie";
import { Request } from "express";
import { Logger } from "../logger";

export function generateContextFromRequest(
    container: ContainerInstance,
    request: Request,
    connection?: ExecutionParams
) {
    const token = getJwtToken(request, connection);
    if (!token) {
        return {};
    }

    try {
        const payload = container.get(AuthorizationService).getPayload(token);
        return {
            auth: {
                userId: payload.userId
            }
        };
    } catch (e) {
        container.get(Logger).log("context", "Invalid JWT Token %s ", token, e);
        return {};
    }
}

/**
 *
 * @param request
 * @param connection
 */
function getJwtToken(request: Request, connection?: ExecutionParams): string {
    const tokenHeader = getAuthorizationHeader(request, connection);
    if (!tokenHeader) {
        return getJwtTokenFromCookie(request);
    }
    if (tokenHeader.indexOf("Bearer ") !== 0) {
        return "";
    }
    return tokenHeader.replace("Bearer ", "");
}

function getAuthorizationHeader(req: Request, connection?: ExecutionParams) {
    if (connection) {
        return connection.context.Authorization;
    }
    return req.headers.authorization;
}
function getJwtTokenFromCookie(request: Request) {
    const cookies = cookie.parse(request?.headers?.cookie || "");

    return cookies.jwt || "";
}
