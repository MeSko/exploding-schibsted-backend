import { Context } from "../Context";
import { AuthChecker, ResolverTopicData } from "type-graphql";
import { AuthenticationError } from "apollo-server";

/**
 * Check is request with some context is able to perform action
 * @param context
 * @param restrictedForRoles
 */
export const authChecker: AuthChecker<Context> = ({ context }, restrictedForRoles) => {
    return isContextMatchRoles(context, restrictedForRoles);
};

/**
 *
 * @param topicData
 * @param restrictedForRoles
 */
export const authTopicChecker = (
    topicData: ResolverTopicData<any, any, Context>,
    restrictedForRoles: string[]
) => {
    if (isContextMatchRoles(topicData.context, restrictedForRoles)) {
        return;
    }
    throw new AuthenticationError("Can't access to topic");
};

/**
 *
 * @param context
 * @param restrictedForRoles
 */
export const isContextMatchRoles = (
    context: { auth?: Context["auth"] },
    restrictedForRoles: string[]
) => {
    if (restrictedForRoles.length === 0) {
        return !!context.auth;
    }
    if (!context.auth) {
        return false;
    }
    /*
    if (restrictedForRoles.includes(context.auth.role)) {
        return true;
    }

     */
    return false;
};
