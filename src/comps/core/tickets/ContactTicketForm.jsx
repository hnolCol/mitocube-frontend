import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button, Callout, FormGroup, InputGroup, TextArea } from "@blueprintjs/core"
import { api } from "@/api"

const EMPTY = { title: "", description: "" }

export default function ContactTicketForm() {
    const [form, setForm] = useState(EMPTY)
    const queryClient = useQueryClient()

    const createTicket = api.tickets.usePostTicket({
        onSuccess: () => {
            setForm(EMPTY)
            queryClient.invalidateQueries({ queryKey: ["getMyTickets"] })
            queryClient.invalidateQueries({ queryKey: ["getTicketQueue"] })
        }
    })

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
    const valid = form.title.trim().length >= 3 && form.description.trim().length >= 10

    const submit = (e) => {
        e.preventDefault()
        createTicket.mutate(form)
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: 640 }}>
            {createTicket.isSuccess && (
                <Callout intent="success" title="Message sent" style={{ marginBottom: 16 }}>
                    Your reference is <strong>{createTicket.data.reference}</strong>. Our reply will appear in your messages.
                </Callout>
            )}
            {createTicket.isError && (
                <Callout intent="danger" style={{ marginBottom: 16 }}>
                    {createTicket.error?.response?.data?.detail ?? "Could not send your message."}
                </Callout>
            )}

            <FormGroup label="Subject" labelFor="ticket-title">
                <InputGroup id="ticket-title" value={form.title} onChange={set("title")} maxLength={200} />
            </FormGroup>

            <FormGroup label="Message" labelFor="ticket-description" >
                <TextArea id="ticket-description" value={form.description} onChange={set("description")} rows={8} fill />
            </FormGroup>

            <Button type="submit" intent="primary" icon="send-message" text="Send" loading={createTicket.isPending} disabled={!valid} />
        </form>
    )
}