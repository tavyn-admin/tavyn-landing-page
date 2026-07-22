import styles from "./ReportCta.module.css";

export default function ReportCta() {
  return (
    <div className={styles.root}>
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
