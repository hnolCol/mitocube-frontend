import { useMutation, useQuery } from "@tanstack/react-query";
import hooks from "@mitocube/api-hooks";
import { apiClient } from "./client";

/**
 * Attachment endpoints added by backend PR #158 (branch vibe/ticket-attachments-224b46).
 * The published @mitocube/api-hooks package does not expose them yet, so they are
 * implemented here directly on the shared axios client (token attached by interceptor).
 *
 * - GET    /tickets/{ticket_tag}/attachments                  -> TicketAttachmentModel[]
 * - POST   /tickets/{ticket_tag}/attachments (multipart file) -> TicketAttachmentModel (201)
 * - GET    /tickets/{ticket_tag}/attachments/{attachment_tag} -> image file (FileResponse)
 *
 * All three require the ticket raiser or an admin. Downloads are fetched as blobs so
 * the bearer token never appears in a URL.
 */

async function getTicketAttachments_API({ ticket_tag }) {
    const res = await apiClient.get(`/tickets/${ticket_tag}/attachments`);
    return res.data;
}

async function postTicketAttachment_API({ ticket_tag, file }) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/tickets/${ticket_tag}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

async function getTicketAttachmentFile_API({ ticket_tag, attachment_tag }) {
    const res = await apiClient.get(`/tickets/${ticket_tag}/attachments/${attachment_tag}`, {
        responseType: "blob",
    });
    return res.data;
}

async function postConversationAttachment_API({ conversation_tag, file }) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/messages/conversations/${conversation_tag}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

async function getConversationAttachmentFile_API({ conversation_tag, attachment_tag }) {
    const res = await apiClient.get(`/messages/conversations/${conversation_tag}/attachments/${attachment_tag}`, {
        responseType: "blob",
    });
    return res.data;
}

async function postTicketReply_API({ ticket_tag, content = "", resolve = false, attachment_tags = [] }) {
    const res = await apiClient.post(`/tickets/${ticket_tag}/reply`, {
        content, resolve, attachment_tags,
    });
    return res.data;
}

async function postMessageWithAttachments_API({ conversation_tag, content = "", attachment_tags = [] }) {
    const res = await apiClient.post(`/messages/conversations/${conversation_tag}/messages`, {
        content, attachment_tags,
    });
    return res.data;
}

function useGetTicketAttachments(APIParams = { ticket_tag: null }, useQueryOptions = { staleTime: 500 }) {
    return useQuery({
        queryKey: ["getTicketAttachments", APIParams.ticket_tag],
        queryFn: () => getTicketAttachments_API({ ...APIParams }),
        enabled: !!APIParams.ticket_tag,
        ...useQueryOptions,
    });
}

function usePostTicketAttachment(useMutationOptions = {}) {
    return useMutation({
        mutationFn: (APIParams) => postTicketAttachment_API({ ...APIParams }),
        ...useMutationOptions,
    });
}

function useGetTicketAttachmentFile(APIParams = { ticket_tag: null, attachment_tag: null }, useQueryOptions = {}) {
    return useQuery({
        queryKey: ["getTicketAttachmentFile", APIParams.ticket_tag, APIParams.attachment_tag],
        queryFn: () => getTicketAttachmentFile_API({ ...APIParams }),
        enabled: !!APIParams.ticket_tag && !!APIParams.attachment_tag,
        staleTime: Infinity,
        ...useQueryOptions,
    });
}

function usePostConversationAttachment(useMutationOptions = {}) {
    return useMutation({
        mutationFn: (APIParams) => postConversationAttachment_API({ ...APIParams }),
        ...useMutationOptions,
    });
}

function useGetConversationAttachmentFile(APIParams = { conversation_tag: null, attachment_tag: null }, useQueryOptions = {}) {
    return useQuery({
        queryKey: ["getConversationAttachmentFile", APIParams.conversation_tag, APIParams.attachment_tag],
        queryFn: () => getConversationAttachmentFile_API({ ...APIParams }),
        enabled: !!APIParams.conversation_tag && !!APIParams.attachment_tag,
        staleTime: Infinity,
        ...useQueryOptions,
    });
}

function usePostTicketReply(useMutationOptions = {}) {
    return useMutation({
        mutationFn: (APIParams) => postTicketReply_API({ ...APIParams }),
        ...useMutationOptions,
    });
}

function usePostMessageWithAttachments(useMutationOptions = {}) {
    return useMutation({
        mutationFn: (APIParams) => postMessageWithAttachments_API({ ...APIParams }),
        ...useMutationOptions,
    });
}

export const ticketsAPI = {
    ...hooks.tickets.createTicketsAPI(apiClient),
    useGetTicketAttachments,
    usePostTicketAttachment,
    useGetTicketAttachmentFile,
    usePostConversationAttachment,
    useGetConversationAttachmentFile,
    usePostTicketReply,            
    usePostMessageWithAttachments,
};