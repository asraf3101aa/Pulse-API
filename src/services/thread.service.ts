import { db } from '../db';
import { threads, comments, users, threadSubscribers } from '../db/schema';
import { NewThread, NewComment, NewThreadSubscriber } from '../models/thread.model';
import { eq, and, desc, sql } from 'drizzle-orm';
import { serviceError } from '../utils/serviceError';

export const createThread = async (thread: NewThread) => {
    try {
        const newThread = await db.transaction(async (trx) => {
            const [createdThread] = await trx.insert(threads)
                .values({ ...thread })
                .returning();

            if (!createdThread) {
                throw new Error("Failed to create thread");
            }

            const [subscription] = await trx.insert(threadSubscribers)
                .values({ threadId: createdThread.id, userId: thread.authorId })
                .returning();

            if (!subscription) {
                throw new Error("Failed to subscribe author to thread");
            }

            return createdThread;
        });

        return { thread: newThread, message: "Thread created successfully" };
    } catch (error: any) {
        return { thread: null, ...serviceError(error, "Failed to create thread") };
    }
};

export const getThreads = async (page: number = 1, limit: number = 10) => {
    try {
        const offset = (page - 1) * limit;

        const results = await db.select({
            id: threads.id,
            title: threads.title,
            description: threads.description,
            createdAt: threads.createdAt,
            author: {
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
            }
        })
            .from(threads)
            .innerJoin(users, eq(threads.authorId, users.id))
            .where(eq(threads.isDeleted, false))
            .orderBy(desc(threads.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count for pagination metadata
        const countResult = await db.select({ count: sql<number>`count(*)` })
            .from(threads)
            .where(eq(threads.isDeleted, false));
        const count = countResult[0]?.count ?? 0;

        return {
            results,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            totalResults: count,
            message: "Threads fetched successfully"
        };
    } catch (error: any) {
        return { results: [], ...serviceError(error, "Failed to fetch threads") };
    }
};

export const getThreadsByAuthorId = async (authorId: number, page: number = 1, limit: number = 10) => {
    try {
        const offset = (page - 1) * limit;

        const results = await db.select({
            id: threads.id,
            title: threads.title,
            description: threads.description,
            createdAt: threads.createdAt,
            author: {
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
            }
        })
            .from(threads)
            .innerJoin(users, eq(threads.authorId, users.id))
            .where(and(eq(threads.authorId, authorId), eq(threads.isDeleted, false)))
            .orderBy(desc(threads.createdAt))
            .limit(limit)
            .offset(offset);

        const countResult = await db.select({ count: sql<number>`count(*)` })
            .from(threads)
            .where(and(eq(threads.authorId, authorId), eq(threads.isDeleted, false)));
        const count = countResult[0]?.count ?? 0;

        return {
            results,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            totalResults: count,
            message: "User threads fetched successfully"
        };
    } catch (error: any) {
        return { results: [], ...serviceError(error, "Failed to fetch user threads") };
    }
};

export const getThreadById = async (id: number) => {
    try {
        const [thread] = await db.select({
            id: threads.id,
            title: threads.title,
            description: threads.description,
            createdAt: threads.createdAt,
            author: {
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
            }
        })
            .from(threads)
            .innerJoin(users, eq(threads.authorId, users.id))
            .where(and(eq(threads.id, id), eq(threads.isDeleted, false)))
            .limit(1);

        if (!thread) return { thread: null, message: "Thread not found" };

        const threadComments = await db.select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            author: {
                id: users.id,
                username: users.username,
                firstName: users.firstName,
                lastName: users.lastName,
            }
        })
            .from(comments)
            .innerJoin(users, eq(comments.authorId, users.id))
            .where(eq(comments.threadId, id))
            .orderBy(desc(comments.createdAt));

        return { thread: { ...thread, comments: threadComments }, message: "Thread fetched successfully" };
    } catch (error: any) {
        return { thread: null, ...serviceError(error, "Failed to fetch thread") };
    }
};

export const createComment = async (comment: NewComment) => {
    try {
        const [newComment] = await db.insert(comments).values(comment).returning();
        return { comment: newComment, message: "Comment added successfully" };
    } catch (error: any) {
        return { comment: null, ...serviceError(error, "Failed to add comment") };
    }
};

export const subscribeToThread = async (subscription: NewThreadSubscriber) => {
    try {
        const [newSubscription] = await db.insert(threadSubscribers).values(subscription).returning();
        return { subscription: newSubscription, message: "Subscribed successfully" };
    } catch (error: any) {
        return { subscription: null, ...serviceError(error, "Failed to subscribe") };
    }
};

export const unsubscribeFromThread = async (threadId: number, userId: number) => {
    try {
        await db.delete(threadSubscribers).where(
            and(
                eq(threadSubscribers.threadId, threadId),
                eq(threadSubscribers.userId, userId)
            )
        );
        return { message: "Unsubscribed successfully" };
    } catch (error: any) {
        return { ...serviceError(error, "Failed to unsubscribe") };
    }
};

export const getSubscription = async (threadId: number, userId: number) => {
    try {
        const [subscription] = await db.select()
            .from(threadSubscribers)
            .where(
                and(
                    eq(threadSubscribers.threadId, threadId),
                    eq(threadSubscribers.userId, userId)
                )
            )
            .limit(1);
        return { subscription, message: subscription ? "Subscription found" : "No subscription found" };
    } catch (error: any) {
        return { subscription: null, ...serviceError(error, "Failed to get subscription") };
    }
};

export const getThreadSubscribers = async (threadId: number) => {
    try {
        const subscribers = await db.select()
            .from(threadSubscribers)
            .where(eq(threadSubscribers.threadId, threadId));
        return { subscribers, message: "Subscribers fetched successfully" };
    } catch (error: any) {
        return { subscribers: [], ...serviceError(error, "Failed to fetch subscribers") };
    }
};
