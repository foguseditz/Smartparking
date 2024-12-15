import Image from "next/image";
import styles from "@/styles/footer.module.css"

export default function Footer() {
    return (
        <Image
          src="/footer.svg"
          alt="Footer_BG"
          width={100}
          height={500}
          className={styles.footerbg}
        />
    );
}
