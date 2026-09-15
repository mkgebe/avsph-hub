import {
  BookOpen,
  CreditCard,
  ShieldCheck,
  FileText,
  CheckCircle,
  Clock,
  Key,
  LucideIcon,
  List,
  Users,
  Calendar,
  Mic,
  Plane,
  Mail,
  MessageSquare,
  ShoppingBag,
  Target,
  Shield,
  Heart,
  Zap,
  Coffee,
  Phone,
  PlaneTakeoff,
  Globe,
  Home,
  Pencil,
  Send,
  AlertTriangle,
  CreditCard as CardIcon,
  Thermometer,
  Wind,
  Wrench,
  AlertCircle,
  Info,
  Sparkles,
  Droplets,
  Star,
  Bug,
  Waves,
  Plug,
  Leaf,
  Bot,
  Cpu,
  Layers,
  Palette,
  Layout,
  Play,
  Search,
  Columns,
  Book,
  Hash,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReactNode } from "react";
import { DocGroup } from "./types";
export const onboardingSections: DocGroup[] = [
  {
    title: "ONBOARDING",
    items: [
      {
        id: "onboarding-vision",
        label: "Vision & Mission",
        icon: Globe,
        sections: [
          {
            title: "Our Vision",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg italic font-serif leading-relaxed text-foreground/80">
                  "We imagine a world where running a business feels easier, so
                  owners can focus on what they love and grow with confidence."
                </p>
                <p>
                  What drives us every single day at AVSPH is the commitment to
                  simplify operations for business owners.
                </p>
              </div>
            ),
          },
          {
            title: "Our Mission",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg italic font-serif leading-relaxed text-foreground/80">
                  "Our mission is to make business owners' lives easier by
                  providing support that simplifies operations and supports
                  growth."
                </p>
              </div>
            ),
          },
        ],
      },
      {
        id: "onboarding-setup",
        label: "Onboarding Setup",
        icon: BookOpen,
        sections: [
          {
            title: "1. Create Company Email",
            content: (
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Create your company email, format is{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
                    yourname.avs@gmail.com
                  </code>{" "}
                  (example:{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
                    juandelacruz.avs@gmail.com
                  </code>
                  ).
                </p>
                <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                  <p className="font-medium">
                    This new email will be utilized for client and AVSPH
                    communications. You are not allowed to use personal email.
                  </p>
                </div>
              </div>
            ),
          },
          {
            title: "2. Fill out Database",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Please fill out the AVSPH VA Database, the information
                  gathered is solely for agency purposes.
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSch8623fnUZMxeU3l1TU47Amxg70qnNbz_SmBYhc3jKssks-g/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Fill out Form
                </a>
              </div>
            ),
          },
          {
            title: "3. Inform HR",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Inform HR of your new email by sending an email to{" "}
                  <a
                    href="mailto:admin@advancedvirtualstaff.com"
                    className="text-primary hover:underline"
                  >
                    admin@advancedvirtualstaff.com
                  </a>
                </p>

                <div className="bg-muted/50 p-4 rounded-lg border font-mono text-sm space-y-4 text-foreground relative">
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Subject:
                    </span>{" "}
                    New VA Email
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground">
                      Body:
                    </span>
                    <br />
                    <br />
                    Good day,
                    <br />
                    <br />
                    This is (yourname) and I am now using this email for company
                    use. I was hired as (position). My client is (name of
                    client) and I am working (# of hours).
                    <br />
                    <br />
                    Thank you!
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "4. Client Kick-off & Hand-off",
            content: (
              <div className="space-y-4 text-muted-foreground mt-4 p-4 border border-dashed rounded-lg bg-muted/20">
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li>
                    <strong>Introduction:</strong> How to initiate the first
                    communication with your client.
                  </li>
                  <li>
                    <strong>Scheduling:</strong> Arranging the initial kick-off
                    call.
                  </li>
                  <li>
                    <strong>First Week Expectations:</strong> What to prepare
                    for in your first 5 days.
                  </li>
                </ul>
              </div>
            ),
          },
        ],
      },
    ],
  },
  {
    title: "GETTING STARTED",
    items: [
      {
        id: "getting-started",
        label: "Getting Started",
        icon: BookOpen,
        sections: [
          {
            title: "Tools & Work Setup",
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <p className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Home className="w-4 h-4" /> Hardware
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Desktop or laptop with reliable specifications</li>
                      <li>USB noise-cancelling headset with microphone</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <p className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Internet
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Minimum 20 Mbps stable connection</li>
                      <li>Always have a backup internet ready</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-primary/5">
                  <p className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <Coffee className="w-4 h-4" /> Workspace
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Quiet, professional work environment</li>
                    <li>Free from background noise and distractions</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "Work Hours & Schedule",
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 text-center border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary italic">
                      11PM-9AM
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Typical Shift (PH)
                    </div>
                  </div>
                  <div className="p-4 text-center border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary italic">
                      8 hrs
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Full-Time Daily
                    </div>
                  </div>
                  <div className="p-4 text-center border rounded-lg bg-muted/30">
                    <div className="text-2xl font-bold text-primary italic">
                      5 days
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Per Week
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      Shift hours vary per client — confirm exact schedule.
                    </li>
                    <li>
                      Changes require mutual agreement and management approval.
                    </li>
                    <li>New client = new updated contract.</li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "Daily Operations & Reporting",
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Daily
                      Attendance
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Log IN in the WhatsApp group at shift start</li>
                      <li>Log OUT at end of shift</li>
                      <li>
                        Keep your work hours aligned with your client shift
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" /> EOD Submission
                      (Dashboard)
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Go to Staff Dashboard and open My EOD Reports</li>
                      <li>Click Submit EOD to open the form</li>
                      <li>
                        If status is Needs Revision, use the Resubmit action
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-xl border border-border">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    EOD Form Fields (Actual Dashboard)
                  </h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong className="text-foreground">Date</strong>{" "}
                        (required)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Regular Hours
                        </strong>{" "}
                        (required, 0-24)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Overtime Hours
                        </strong>{" "}
                        (optional, default 0)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Night Differential Hours
                        </strong>{" "}
                        (optional)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Tasks Completed
                        </strong>{" "}
                        (required)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Worked On-Site
                        </strong>{" "}
                        (checkbox)
                      </li>
                      <li>
                        <strong className="text-foreground">Challenges</strong>,{" "}
                        <strong className="text-foreground">
                          Next Day Plan
                        </strong>
                        , and{" "}
                        <strong className="text-foreground">
                          Additional Notes
                        </strong>{" "}
                        (optional)
                      </li>
                    </ul>
                    <div className="p-3 rounded-md border border-border/60 bg-background text-xs">
                      Total Hours Worked is auto-computed by the system: Regular
                      + Overtime.
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Emergency Contact Flow",
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <MessageSquare className="w-4 h-4 text-primary" />{" "}
                      WhatsApp
                    </div>
                    <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-1">
                      <div>
                        <div className="text-sm font-medium">
                          Step 1 — DM HR
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Direct message HR (not in group).
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          Step 2 — "Emergency" tag
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Start with "Emergency" for urgent items.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-semibold">
                      <Target className="w-4 h-4 text-primary" /> Escalation
                    </div>
                    <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-1 text-sm text-muted-foreground">
                      <p>1. Immediate Supervisor</p>
                      <p>2. HR via WhatsApp</p>
                      <p>3. Operations Manager</p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Meetings & Check-ins",
            content: (
              <div className="space-y-2">
                <p className="font-semibold text-primary">ATTEND:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>1-2 Team Meetings per quarter</li>
                  <li>5-10 minute weekly Kumustahan with HR</li>
                  <li>
                    2 Kumustahan sessions must be attended before bi-monthly
                    compensation is released
                  </li>
                </ul>
              </div>
            ),
          },
          {
            title: "Communication & Support",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Respond within 1-2 hrs during your work schedule.</li>
                  <li>Notify HR if late or offline. Through WhatsApp.</li>
                  <li>Keep messages clear & professional.</li>
                </ul>

                <div className="p-4 border border-dashed rounded-lg bg-muted/20">
                  <h4 className="font-semibold text-foreground mb-2">
                    Escalation & Support Contacts
                  </h4>
                  <p className="italic mb-2">
                    Note: Placeholder for specific contact information.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      <strong className="text-foreground">
                        Payroll Issues:
                      </strong>{" "}
                      accounting@advancedvirtualstaff.com
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Client Disputes/Issues:
                      </strong>{" "}
                      [Account Manager Contact]
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Technical Support:
                      </strong>{" "}
                      [IT Contact]
                    </li>
                  </ul>
                </div>
              </div>
            ),
          },
        ],
      },
      {
        id: "policies",
        label: "Policies and Regulation",
        icon: ShieldCheck,
        sections: [
          {
            title: "Confidentiality & NDA",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <p className="text-sm">
                  Protecting client and company information is a core legal
                  obligation. This includes client data, business strategies,
                  and internal documents.
                </p>
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-start gap-3">
                  <Shield className="w-5 h-5 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <strong>Legal Penalty:</strong> Breach of confidentiality
                    can result in liquidated damages of up to{" "}
                    <strong>₱500,000</strong>.
                  </div>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Return all files/documents upon contract termination.</li>
                  <li>
                    Do not use info for personal gain or for a third party.
                  </li>
                  <li>
                    Exception: Info that becomes public through no fault of
                    yours.
                  </li>
                </ul>
              </div>
            ),
          },
          {
            title: "Non-Compete & Non-Solicitation",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Non-Compete
                    </h4>
                    <p className="text-xs italic mb-2">
                      During contract + 2 years after
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      <li>No similar businesses to AVSPH</li>
                      <li>Applies to current/former client businesses</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Non-Solicitation
                    </h4>
                    <p className="text-xs italic mb-2">
                      2 years after contract ends
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      <li>Do not recruit any AVSPH staff/agents</li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 bg-muted/40 text-xs rounded-lg border border-dashed">
                  <strong>Financial Penalties:</strong> AVSPH staff hired
                  through you → ₱500,000 damages. Client solicited away →
                  reimburse 2 years of lost profits.
                </div>
              </div>
            ),
          },
          {
            title: "Restrictions (The Four Absolutes)",
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Do NOT work for clients outside AVSPH",
                    "Do NOT engage with competitors",
                    "Do NOT solicit or accept side jobs",
                    "Do NOT receive direct client payments",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="p-3 border rounded-lg bg-destructive/[0.03] text-destructive flex items-center gap-2 text-xs font-medium"
                    >
                      <CheckCircle className="w-4 h-4 shrink-0 opacity-50" />
                      {text}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <p className="text-xs text-muted-foreground italic">
                    "When you follow these guidelines, you protect yourself,
                    your clients, and the entire team."
                  </p>
                </div>
              </div>
            ),
          },
          {
            title: "Termination Guidelines",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-lg bg-background shadow-sm">
                    <div className="text-sm font-semibold text-foreground">
                      Voluntary Notice
                    </div>
                    <div className="text-sm font-bold text-primary italic">
                      14 Days Required
                    </div>
                  </div>
                  <p className="text-xs pl-1">
                    Failure to complete notice = final payout forfeited. AWOL is
                    grounds for immediate termination without pay.
                  </p>
                </div>
                <div className="p-4 border border-dashed rounded-lg bg-muted/20">
                  <h4 className="font-semibold text-foreground mb-2 text-xs uppercase tracking-tighter italic">
                    Involuntary (Immediate)
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>Inducing employees or clients to leave</li>
                    <li>Acts of disloyalty or fraud</li>
                    <li>Disclosing confidential information</li>
                  </ul>
                </div>
              </div>
            ),
          },
        ],
      },
      {
        id: "payment",
        label: "Payment and Benefits",
        icon: CreditCard,
        sections: [
          {
            title: "Compensation & Bonuses",
            content: (
              <div className="space-y-4 text-muted-foreground p-4 bg-muted/30 rounded-lg border">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  General Terms
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground">Rate:</strong> Depends
                    on client agreement.
                  </li>
                  <li>
                    <strong className="text-foreground">Schedule:</strong>{" "}
                    Bi-monthly payouts. Any delays will be communicated 3 days
                    prior.
                  </li>
                  <li>
                    <strong className="text-foreground">Requirement:</strong>{" "}
                    Invoice submission via email is required before each payout.
                  </li>
                </ul>

                <div className="mt-4 p-4 border border-dashed rounded-lg bg-background">
                  <h4 className="font-semibold text-foreground mb-2">
                    Invoice Submission Instructions
                  </h4>
                  <p className="italic mb-2 text-sm">
                    Note: Placeholder for invoicing procedure.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      <strong className="text-foreground">
                        Where to send:
                      </strong>{" "}
                      avsph.eod@gmail.com
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Subject Line Format:
                      </strong>{" "}
                      Invoice - [Your Name] - [Cut-off Date]
                    </li>
                    <li>
                      <strong className="text-foreground">
                        Cut-off Dates:
                      </strong>{" "}
                      15th and 30th of the month.
                    </li>
                    <li>
                      <strong className="text-foreground">Template:</strong>{" "}
                      Link to approved invoice template.
                    </li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            title: "Incentives After 1 Year",
            content: (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    label: "Loyalty Bonus",
                    value: "P10,000",
                    desc: "One Time Reward",
                  },
                  {
                    label: "Quarterly Bonus",
                    value: "P2,000",
                    desc: "Every 3 months",
                  },
                  {
                    label: "WiFi Allowance",
                    value: "P1,000",
                    desc: "Monthly subsidy",
                  },
                  {
                    label: "Medical Reimbursement",
                    value: "P5,000",
                    desc: "Health support",
                  },
                  {
                    label: "Year-End Bonus",
                    value: "Bonus",
                    desc: "Every December",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-4 bg-background border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="text-2xl font-bold text-primary mt-1">
                      {item.value}
                    </span>
                    <span className="text-xs text-muted-foreground mt-2">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            ),
          },
          {
            title: "Leave Entitlement",
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: "5", unit: "days", lbl: "Paid Leaves/Year" },
                    { val: "2", unit: "days", lbl: "Max Consecutive" },
                    { val: "1", unit: "mo", lbl: "Notice Required" },
                    { val: "1", unit: "yr", lbl: "Service Required" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="p-3 text-center border rounded-lg bg-muted/30"
                    >
                      <div className="text-2xl font-bold text-primary">
                        {s.val}
                        <span className="text-sm font-normal ml-1 text-muted-foreground">
                          {s.unit}
                        </span>
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                        {s.lbl}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Eligibility</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-4">
                      <li>Full-time contractor: 8 hrs/day, 5 days/week</li>
                      <li>
                        Completed 1 full year of continuous active service
                      </li>
                      <li>
                        File request at least 1 month in advance (except
                        emergencies)
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">How to File</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-4">
                      <li>Direct WhatsApp to HR (not the group chat)</li>
                      <li>
                        Format:{" "}
                        <strong className="text-foreground">
                          [Your Name] – Leave Request
                        </strong>{" "}
                        with dates and reason
                      </li>
                      <li>
                        Attach proof if sick or emergency (supporting docs help
                        approval)
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-700 dark:text-amber-400 text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Year of Stay Reset:</strong> Periods where you were
                    "On Pause" do NOT count toward your Year of Stay and cause
                    your count to reset upon return.
                  </div>
                </div>
              </div>
            ),
          },
          {
            title: "Conversion Rate Policy",
            content: (
              <div className="space-y-4">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold">
                          If Foreign Exchange Rate is
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Conversion Rate Used
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Lower than ₱56</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₱53
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>₱56</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₱54
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>₱57</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₱55
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 bg-muted/40 rounded-lg text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-50" />
                  Rates are reviewed periodically based on market stability.
                </div>
              </div>
            ),
          },
          {
            title: "Cash Advance Policy",
            content: (
              <div className="space-y-6 text-muted-foreground">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-400">
                  <div className="flex gap-2">
                    <Zap className="w-5 h-5 shrink-0" />
                    <div className="text-sm">
                      <strong>Emergency only:</strong> Requests without proof
                      will NOT be processed.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Eligibility
                    </h4>
                    <ul className="list-disc pl-5 text-xs space-y-1">
                      <li>Min. 6 months tenure</li>
                      <li>Max. 50% of upcoming payment</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Regulations
                    </h4>
                    <ul className="list-disc pl-5 text-xs space-y-1">
                      <li>Genuine emergencies only</li>
                      <li>Supporting documents required</li>
                    </ul>
                  </div>
                </div>

                <p className="text-[10px] uppercase font-bold text-destructive">
                  Misuse may result in termination.
                </p>
              </div>
            ),
          },
        ],
      },
    ],
  },
  {
    title: "PLATFORM GUIDE",
    items: [
      {
        id: "dashboard-login",
        label: "Dashboard Login",
        icon: Key,
        sections: [
          {
            title: "Accessing the Platform",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <p>
                  After your contract is confirmed, HR will send you an email
                  containing your credentials for the Staff Dashboard. Keep an
                  eye on your new company email for these details.
                </p>
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h4 className="font-semibold text-foreground mb-2">
                    How to Login:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Navigate to the AVSPH Dashboard Login Page.</li>
                    <li>
                      Ensure the{" "}
                      <strong className="text-foreground">Staff</strong> tab is
                      selected at the top of the login form.
                    </li>
                    <li>
                      Enter the Email Address and temporary Password from the HR
                      email.
                    </li>
                    <li>
                      Click <strong className="text-foreground">Sign In</strong>
                      .
                    </li>
                    <li>
                      <em>
                        Note: Upon your first login, or as directed by HR, you
                        may need to update your password for security purposes.
                      </em>
                    </li>
                  </ol>
                </div>
              </div>
            ),
          },
        ],
      },
      {
        id: "daily-eods",
        label: "Daily EODs",
        icon: Clock,
        sections: [
          {
            title: "Submitting Your EOD (End of Day)",
            content: (
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Once you are logged in and start working, you are required to
                  submit an End of Day (EOD) report daily through the Staff
                  Dashboard to track your tasks and hours.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-semibold text-primary mb-1">
                      EOD Page Overview
                    </h4>
                    <p className="text-sm">
                      On your EOD page, you can see your Estimated Pay, count of
                      Approved/Pending EODs, and your Next Payout date at the
                      top.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-1">Managing EODs</h4>
                    <p className="text-sm">
                      You can view your past submissions in the table, check
                      their status, and filter them by date or status.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h4 className="font-semibold text-foreground mb-3">
                    EOD Submission Guide:
                  </h4>
                  <ol className="list-decimal pl-5 space-y-3 mb-4">
                    <li>
                      Go to the{" "}
                      <strong className="text-foreground">Daily EODs</strong>{" "}
                      section from your dashboard sidebar.
                    </li>
                    <li>
                      Click on the{" "}
                      <strong className="text-foreground">Submit EOD</strong>{" "}
                      button.
                    </li>
                    <li>
                      Fill out all the required fields in the submission form
                      accurately.
                    </li>
                  </ol>

                  <div className="mt-4 p-4 border border-primary/20 bg-background rounded-md space-y-2">
                    <p className="font-semibold text-primary underline mb-2">
                      Form Fields Overview:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>
                        <strong className="text-foreground">Date:</strong> The
                        specific date the work was performed (defaults to
                        today).
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Total Hours Worked:
                        </strong>{" "}
                        Your total shift hours (e.g., 8).
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Regular / Overtime / Night Diff Hours:
                        </strong>{" "}
                        Breakdown of your hours.{" "}
                        <em>
                          (If regular hours are left blank, the system treats
                          your total hours as regular hours).
                        </em>
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Tasks Completed:
                        </strong>{" "}
                        A detailed description of what you accomplished today.
                        (Required)
                      </li>
                      <li>
                        <strong className="text-foreground">Challenges:</strong>{" "}
                        Any blockers or issues you encountered.
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Next Day Plan:
                        </strong>{" "}
                        What you plan to work on during your next shift.
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Additional Notes:
                        </strong>{" "}
                        Any other information you need to relay.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ),
          },
        ],
      },
    ],
  },
];
