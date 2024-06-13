import { Argon2id } from "oslo/password";
import { auth, db, type DatabaseUserAttributes } from "./db";
import * as schema from './schema';
import { eq } from "drizzle-orm";
import { braintreeGateway } from "$lib/braintree";
import { error } from "@sveltejs/kit";

export const createUser = async (
    email: string,
    password: string,
    attributes?: Partial<DatabaseUserAttributes>
) => {
    const hashedPassword = await new Argon2id().hash(password);

    return db.transaction(async (tx) => {
        const maybeUser = await tx.query.user.findFirst({
            where: eq(schema.user.id, email)
        });

        if (maybeUser !== undefined) {
            return;
        }

        return (
            await tx
                .insert(schema.user)
                .values({
                    id: email,
                    hashedPassword,
                    ...attributes
                })
                .returning()
        )[0];
    });
};

export const createSession = async (email: string) => {
    const session = await auth.createSession(email, {});
    return auth.createSessionCookie(session.id);
};

export const verifyPassword = async (email: string, password: string) => {
    const user = await db.query.user.findFirst({
        where: eq(schema.user.id, email)
    });
    if (user === undefined) {
        // For security, we hash the password anyways so that our response times
        // are the same with invalid username vs invalid password.
        await new Argon2id().hash(password);
        return 'User does not exist';
    }

    if (user.isLocked) {
        return 'User is locked';
    }

    const isPasswordValid = await new Argon2id().verify(user.hashedPassword, password);
    if (!isPasswordValid) {
        return 'Password is invalid';
    }

    return user;
};

export const updateUserPassword = async (email: string, password: string) => {
    const hashedPassword = await new Argon2id().hash(password);
    const condition = eq(schema.user.id, email);

    return db.transaction(async (tx) => {
        const user = await tx.query.user.findFirst({
            where: condition
        });

        if (user === undefined) {
            return 'User does not exist';
        }

        await db.update(schema.user).set({ hashedPassword }).where(condition);
        await auth.invalidateUserSessions(user.id);
    });
};

export const updateUserEmail = async (email: string, newEmail: string) => {
    const condition = eq(schema.user.id, email);

    await db.transaction(async (tx) => {
        const user = await tx.query.user.findFirst({
            where: condition
        });

        if (user === undefined) {
            error(400, "User does not exist")
        }

        await db.update(schema.user).set({ id: newEmail }).where(condition);
        if (user.customer !== null) {
            try {
                await braintreeGateway.customer.update(user.customer, {
                    email: newEmail
                });
            } catch (err) {
                if (!((err as any).type === 'notFoundError')) {
                    throw err;
                }
            }
        }
    });

    await auth.invalidateUserSessions(newEmail);
};

export const deleteUser = async (email: string) => {
    return db.transaction(async (tx) => {
        const user = await tx.query.user.findFirst({
            where: eq(schema.user.id, email),
            with: {
                customer: {
                    with: {
                        subscription: true
                    }
                }
            }
        });
        if (user === undefined) return;

        if (user.customer !== null) {
            try {
                await braintreeGateway.customer.delete(user.customer.braintreeCustomerId);
            } catch (err) {
                if (!((err as any).type === 'notFoundError')) {
                    throw err;
                }
            }
        }

        await tx.delete(schema.user).where(eq(schema.user.id, user.id));
    })
}