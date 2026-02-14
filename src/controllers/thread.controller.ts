import catchAsync from '../utils/catchAsync';
import { threadService, notificationService } from '../services';
import ApiResponse from '../utils/ApiResponse';

export const createThread = catchAsync(async (req, res) => {
    const { thread, message } = await threadService.createThread({
        ...req.body,
        authorId: req.user.id,
    });

    if (!thread) {
        return ApiResponse.error(res, message);
    }
    return ApiResponse.created(res, thread, message);
});

export const getThreads = catchAsync(async (req, res) => {
    const page = parseInt(req.query['page'] as string, 10) || 1;
    const limit = parseInt(req.query['limit'] as string, 10) || 10;
    const { results, page: p, limit: l, totalPages, totalResults, message } = await threadService.getThreads(page, limit);
    return ApiResponse.success(res, { results, page: p, limit: l, totalPages, totalResults }, message);
});

export const getAuthUserThreads = catchAsync(async (req, res) => {
    const page = parseInt(req.query['page'] as string, 10) || 1;
    const limit = parseInt(req.query['limit'] as string, 10) || 10;
    const { results, page: p, limit: l, totalPages, totalResults, message } = await threadService.getThreadsByAuthorId(req.user.id, page, limit);
    return ApiResponse.success(res, { results, page: p, limit: l, totalPages, totalResults }, message);
});

export const getThread = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const { thread, message } = await threadService.getThreadById(threadId);
    if (!thread) {
        return ApiResponse.notFound(res, message || 'Thread not found');
    }
    return ApiResponse.success(res, thread, message);
});

export const createComment = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const { thread, message: threadMsg } = await threadService.getThreadById(threadId);

    if (!thread) {
        return ApiResponse.notFound(res, threadMsg || 'Thread not found');
    }

    const { comment, message } = await threadService.createComment({
        ...req.body,
        threadId: threadId,
        authorId: req.user.id,
    });

    if (!comment) {
        return ApiResponse.error(res, message);
    }

    // Notify all subscribers except the commenter
    const { subscribers } = await threadService.getThreadSubscribers(threadId);
    if (subscribers) {
        for (const sub of subscribers) {
            if (sub.userId !== req.user.id) {
                await notificationService.sendNotification(
                    sub.userId,
                    'New comment on thread',
                    `${req.user.username} commented on "${thread.title}"`,
                    'thread_comment'
                );
            }
        }
    }

    return ApiResponse.created(res, comment, message);
});

export const subscribe = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const userId = req.user.id;

    const { subscription } = await threadService.getSubscription(threadId, userId);
    if (subscription) {
        return ApiResponse.success(res, null, 'Already subscribed');
    }

    const { message } = await threadService.subscribeToThread({ threadId, userId });
    return ApiResponse.success(res, null, message);
});

export const unsubscribe = catchAsync(async (req, res) => {
    const threadId = parseInt(req.params['id'] as string, 10);
    const userId = req.user.id;

    const { message } = await threadService.unsubscribeFromThread(threadId, userId);
    return ApiResponse.success(res, null, message);
});


