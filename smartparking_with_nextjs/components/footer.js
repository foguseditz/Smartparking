import Image from "next/image";

export default function Footter() {
    return (
      <footer>
        <Image
          src="/footer.svg"
          alt="Footer_BG"
          width={100}
          height={100}
          className="footer"
        />
      </footer>
    );
}
