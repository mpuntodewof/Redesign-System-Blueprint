import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { INTENTS, intentInfo, type ContactIntent } from "@/components/contact/intents";
import { openUrl } from "@/lib/openUrl";
import { EMAIL, LINKEDIN_URL, REPLY_TIME } from "@/lib/profile";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

const contactSchema = z.object({
  intent: z.enum(["full-time", "contract", "project"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  timeline: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Please add a little more detail (at least 10 characters)"),
  /** Honeypot: hidden from people, ticked by bots. */
  botcheck: z.boolean().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const blank = (intent: ContactIntent): ContactFormValues => ({
  intent,
  name: "",
  email: "",
  timeline: "",
  budget: "",
  message: "",
  botcheck: false,
});

const subjectFor = (data: ContactFormValues) => `[Portfolio] ${intentInfo(data.intent).label} — ${data.name}`;

const bodyFor = (data: ContactFormValues) =>
  [
    `Interest: ${intentInfo(data.intent).label}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Timeline: ${data.timeline || "—"}`,
    `Budget / rate: ${data.budget || "—"}`,
    "",
    data.message,
  ].join("\n");

const mailtoFor = (data: ContactFormValues) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subjectFor(data))}&body=${encodeURIComponent(bodyFor(data))}`;

interface ContactFormDialogProps {
  open: boolean;
  intent: ContactIntent;
  onOpenChange: (open: boolean) => void;
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; mailto: string };

const ContactFormDialog = ({ open, intent, onOpenChange }: ContactFormDialogProps) => {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const form = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema), defaultValues: blank(intent) });
  const current = intentInfo(form.watch("intent") ?? intent);

  // Each opening starts fresh with the intent of the button that opened it.
  useEffect(() => {
    if (open) {
      form.reset(blank(intent));
      setStatus({ kind: "idle" });
    }
  }, [open, intent, form]);

  const onSubmit = async (data: ContactFormValues) => {
    if (data.botcheck) {
      setStatus({ kind: "sent" });
      return;
    }
    const key = import.meta.env.VITE_WEB3FORMS_KEY;
    if (!key) {
      openUrl(mailtoFor(data));
      onOpenChange(false);
      toast.success("Your email app should open with the message ready.", { description: EMAIL });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // A hung request would leave the button on "Sending…"; time out into the email fallback.
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          access_key: key,
          subject: subjectFor(data),
          from_name: "Portfolio contact form",
          name: data.name,
          email: data.email,
          replyto: data.email,
          interest: intentInfo(data.intent).label,
          timeline: data.timeline || "—",
          budget: data.budget || "—",
          message: data.message,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error(`Web3Forms ${response.status}`);
      setStatus({ kind: "sent" });
      toast.success("Message sent", { description: `I reply within ${REPLY_TIME}.` });
    } catch {
      setStatus({ kind: "error", mailto: mailtoFor(data) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto border-border sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">{current.title}</DialogTitle>
          <DialogDescription>I reply within {REPLY_TIME}.</DialogDescription>
        </DialogHeader>

        {status.kind === "sent" ? (
          <div className="space-y-4 py-2">
            <p className="text-lg font-semibold text-foreground">Thanks — message sent.</p>
            <p>It's in my inbox now; expect a reply within {REPLY_TIME}.</p>
            <button type="button" className="btn" onClick={() => onOpenChange(false)}>
              Close
            </button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="intent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I'm interested in</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INTENTS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@company.com" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. start next month, 3 months" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget or rate range (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="any currency, or leave blank" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder={current.placeholder} className="min-h-[110px] resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Honeypot (Web3Forms convention): invisible to people and screen readers. */}
              <input
                type="checkbox"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
                {...form.register("botcheck")}
              />

              {status.kind === "error" && (
                <p role="alert" className="rounded border border-destructive/50 px-3 py-2 text-sm">
                  The message couldn't be sent right now.{" "}
                  <a className="font-medium text-foreground underline" href={status.mailto}>
                    Send via email instead
                  </a>
                </p>
              )}

              <div className="flex flex-col gap-3 pt-1">
                <button type="submit" className="btn btn-primary w-full justify-center" disabled={status.kind === "sending"}>
                  {status.kind === "sending" ? "Sending…" : "Send message →"}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Or reach out directly via{" "}
                  <a href="https://wa.me/6282219158765" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                    WhatsApp
                  </a>{" "}
                  or{" "}
                  <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">
                    LinkedIn
                  </a>
                </p>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
