interface Props {
  className?: string;
  hideBorder?: boolean;
}

export default function JMRLogo({
  className = "w-12 h-12",
}: Props) {
  return (
    <img
      src="/assets/logo.jpeg"
      alt="Jagan Mohan Rice Mill"
      className={`${className} object-contain`}
    />
  );
}