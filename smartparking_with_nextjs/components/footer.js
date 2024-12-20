import Image from "next/image";

export default function Footer() {
    return (
      <footer>
        <Image
          src="/footer.svg"
          alt="Footer Background"
          width={100}
          height={100}
          class="h-full w-full"
        />
      </footer>
    );
}
