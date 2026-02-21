export type ContractTemplate = {
  id: string;
  title: string;
  purpose: string;
  clause: string;
};

export type NegotiationScript = {
  id: string;
  title: string;
  script: string;
};

export const contractTemplates: ContractTemplate[] = [
  {
    id: "kill-fee",
    title: "Kill Fee Clause",
    purpose: "Protect partial pay when a project is canceled after work starts.",
    clause:
      "If Client cancels after work begins, Client will pay Contractor a kill fee equal to 50% of the remaining contract value, plus payment for all completed work."
  },
  {
    id: "late-payment",
    title: "Late Payment Clause",
    purpose: "Set clear expectations for when invoices are due.",
    clause:
      "Invoices are due within 30 calendar days. Payments received after 30 days include a 1.5% monthly late fee, or the maximum allowed by law."
  },
  {
    id: "scope-revisions",
    title: "Scope and Revisions Clause",
    purpose: "Prevent extra unpaid revisions and scope creep.",
    clause:
      "This agreement includes two revision rounds. Additional revisions or scope changes are billed at Contractor's standard day rate and require written approval."
  }
];

export const negotiationScripts: NegotiationScript[] = [
  {
    id: "rate-floor",
    title: "Rate Floor Response",
    script:
      "Thanks for the opportunity. For this scope, my minimum rate is $X based on reporting, edit load, and delivery timeline. If budget is fixed, we can adjust scope to match."
  },
  {
    id: "payment-terms",
    title: "Payment Terms Follow-Up",
    script:
      "Before we lock the schedule, can we confirm payment terms in writing? I typically work with Net 30 and include a late-fee clause to keep payment timing predictable."
  },
  {
    id: "rights-clarity",
    title: "Rights Clarification",
    script:
      "Can we clarify rights in the agreement? My standard is limited-use rights tied to this project unless broader rights are licensed separately."
  }
];
