import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { openUrl } from "@/lib/openUrl";
import ContactFormDialog from "./ContactFormDialog";

// jsdom forbids redefining window.location, so navigation goes through a mockable helper.
vi.mock("@/lib/openUrl", () => ({ openUrl: vi.fn() }));

const fill = () => {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jane Doe" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@example.com" } });
  fireEvent.change(screen.getByLabelText("Message"), { target: { value: "We need an SAP integration." } });
};
const send = () => fireEvent.click(screen.getByRole("button", { name: /send/i }));

describe("ContactFormDialog", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("VITE_WEB3FORMS_KEY", "test-key");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("titles itself after the intent and promises a realistic reply time", () => {
    render(<ContactFormDialog open intent="contract" onOpenChange={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Contract & part-time enquiry" })).toBeInTheDocument();
    expect(screen.getByText(/1–2 working days/)).toBeInTheDocument();
    expect(screen.queryByText(/24 hours/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$\s?\d/)).not.toBeInTheDocument();
  });

  it("posts the brief to Web3Forms with subject, interest and reply-to", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    render(<ContactFormDialog open intent="project" onOpenChange={() => {}} />);
    fill();
    send();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.web3forms.com/submit");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      access_key: "test-key",
      subject: "[Portfolio] Project — Jane Doe",
      email: "jane@example.com",
      replyto: "jane@example.com",
      interest: "Project",
    });
    expect(await screen.findByText(/Thanks — message sent/)).toBeInTheDocument();
  });

  it("offers the email fallback when sending fails", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ success: false, message: "nope" }), { status: 400 }));
    render(<ContactFormDialog open intent="full-time" onOpenChange={() => {}} />);
    fill();
    send();
    const fallback = await screen.findByRole("link", { name: "Send via email instead" });
    expect(fallback.getAttribute("href")).toMatch(/^mailto:puntodewofadhillah@gmail\.com\?subject=/);
  });

  it("drops submissions that fill the honeypot", async () => {
    const { container } = render(<ContactFormDialog open intent="project" onOpenChange={() => {}} />);
    fill();
    fireEvent.click(container.ownerDocument.querySelector('input[name="botcheck"]')!);
    send();
    expect(await screen.findByText(/Thanks — message sent/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the email app when no key is configured", async () => {
    vi.stubEnv("VITE_WEB3FORMS_KEY", "");
    render(<ContactFormDialog open intent="project" onOpenChange={() => {}} />);
    fill();
    send();
    await waitFor(() => expect(openUrl).toHaveBeenCalledWith(expect.stringMatching(/^mailto:/)));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
