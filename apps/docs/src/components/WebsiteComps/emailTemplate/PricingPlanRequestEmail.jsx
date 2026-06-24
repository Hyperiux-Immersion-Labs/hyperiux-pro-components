export function PricingPlanRequestEmail({
  name,
  email,
  phone,
  message,
  planId,
  planName,
  billingCycle,
  displayedPrice,
  annualTotal,
}) {
  const isYearly = billingCycle === "yearly";

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        padding: "32px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#111111",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid #e8e8e8",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: "13px",
            color: "#ff5f00",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Hyperiux Vault
        </p>

        <h1
          style={{
            margin: "0 0 24px",
            fontSize: "28px",
            lineHeight: "1.1",
            letterSpacing: "-0.04em",
          }}
        >
          New pricing plan request
        </h1>

        <div
          style={{
            backgroundColor: "#111111",
            color: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: "14px", color: "#999999" }}>
            Selected plan
          </p>

          <p style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
            {planName}
          </p>

          <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#cccccc" }}>
            ${displayedPrice}/monthly{" "}
            {isYearly ? "(billed yearly)" : "(billed monthly)"}
          </p>

          {isYearly && Number(annualTotal) > 0 && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: "#999999",
              }}
            >
              Annual billing total: ${annualTotal}
            </p>
          )}
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
          }}
        >
          <tbody>
            <tr>
              <td style={labelCell}>Name</td>
              <td style={valueCell}>{name}</td>
            </tr>
            <tr>
              <td style={labelCell}>Email</td>
              <td style={valueCell}>{email}</td>
            </tr>
            <tr>
              <td style={labelCell}>Phone</td>
              <td style={valueCell}>{phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style={labelCell}>Plan ID</td>
              <td style={valueCell}>{planId}</td>
            </tr>
            <tr>
              <td style={labelCell}>Billing</td>
              <td style={valueCell}>{billingCycle}</td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            borderRadius: "16px",
            backgroundColor: "#f3f3f3",
            padding: "20px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "13px",
              color: "#777777",
              fontWeight: 600,
            }}
          >
            Message
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "15px",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {message || "No message provided."}
          </p>
        </div>
      </div>
    </div>
  );
}

const labelCell = {
  width: "140px",
  padding: "12px 0",
  borderBottom: "1px solid #eeeeee",
  fontSize: "13px",
  color: "#777777",
  verticalAlign: "top",
};

const valueCell = {
  padding: "12px 0",
  borderBottom: "1px solid #eeeeee",
  fontSize: "14px",
  color: "#111111",
  verticalAlign: "top",
};