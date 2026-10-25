import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EMAIL, LINKEDIN_URL } from "@/lib/profile";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  budget: z.string().optional(),
  description: z.string().min(10, "Please describe your project (at least 10 characters)"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactFormDialog = ({ open, onOpenChange }: ContactFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      budget: "",
      description: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    setIsSubmitting(true);

    const budgetText = data.budget ? `\nBudget: ${data.budget}` : "";
    const subject = encodeURIComponent(`Project Inquiry from ${data.name}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to discuss a project.\n\nName: ${data.name}\nEmail: ${data.email}${budgetText}\n\nProject Details:\n${data.description}`
    );

    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setIsSubmitting(false);
      form.reset();
      onOpenChange(false);
      toast.success("Email client opened! If it didn't open, feel free to reach out directly.", {
        description: EMAIL,
        duration: 5000,
      });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl gradient-text">
            Start a Project
          </DialogTitle>
          <DialogDescription>
            Tell me about your project and I'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
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
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Range (optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="< $1,000">Less than $1,000</SelectItem>
                      <SelectItem value="$1,000 - $5,000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="$10,000+">$10,000+</SelectItem>
                      <SelectItem value="Let's discuss">Let's discuss</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe what you need — backend API, full-stack app, system integration, etc."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full font-heading font-semibold text-primary-foreground"
                style={{ backgroundImage: 'linear-gradient(135deg, hsl(239 84% 67%), hsl(263 70% 50%))' }}
              >
                {isSubmitting ? "Opening email client..." : "Send Inquiry"}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Or reach out directly via{" "}
                <a
                  href="https://wa.me/6282219158765"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  WhatsApp
                </a>
                {" "}or{" "}
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  LinkedIn
                </a>
              </p>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormDialog;
