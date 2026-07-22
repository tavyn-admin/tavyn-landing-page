import type { CSSProperties } from "react";

import styles from "./ReportCta.module.css";

export default function ReportCta() {
  const tokenVars = {
    "--report-cta-bg":
      "linear-gradient(0deg, rgba(255, 0, 0, 0.16) 0%, rgba(255, 193, 0, 0.08) 100%), #050506",
  } as CSSProperties;

  return (
    <div className={styles.root} style={tokenVars}>
      <div className={styles.content}>
        <div className={styles.copy}>
          <h2 className={styles.heading}>
            <span>Stop waiting.</span>
            <span>Turn plans into results.</span>
          </h2>
          <p className={styles.supportingText}>
            Join the waitlist to see exactly what Tavyn would create next, including your priority topics and specific
            target queries for the recommended content angles listed above.
          </p>
        </div>

        <a className={styles.waitlistButton} href="/waitlist">
          Join Waitlist
        </a>
      </div>
    </div>
  );
}
