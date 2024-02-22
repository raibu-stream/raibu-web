import { eq, sql } from 'drizzle-orm';
import { db } from './db';
import { timeOut } from './schema';
import { TimeSpan } from 'lucia';
import { createDate, isWithinExpirationDate } from 'oslo';

export const incrementOrCreateTimeout = async (
	id: string,
	expires: Date = createDate(new TimeSpan(1, 'm'))
) => {
	return db.transaction(async (tx) => {
		const timeout = await tx.query.timeOut.findFirst({
			where: eq(timeOut.timerId, id)
		});

		if (timeout !== undefined) {
			if (!isWithinExpirationDate(timeout.expires)) {
				await tx.delete(timeOut).where(eq(timeOut.timerId, id));
			} else {
				return (
					await tx
						.update(timeOut)
						.set({ attempts: sql`${timeOut.attempts} + 1` })
						.where(eq(timeOut.timerId, id))
						.returning()
				)[0];
			}
		}

		return (
			await tx
				.insert(timeOut)
				.values({
					timerId: id,
					expires,
					attempts: 1
				})
				.returning()
		)[0];
	});
};
