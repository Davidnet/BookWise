import { BookOpen, type LucideProps } from "lucide-react";

export const Icons = {
  logo: (props: LucideProps) => <BookOpen {...props} />,
  google: (props: LucideProps) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.98-4.48 1.98-3.52 0-6.48-2.89-6.48-6.48s2.96-6.48 6.48-6.48c1.98 0 3.06.83 3.82 1.56l2.34-2.34C18.42 2.37 15.82 1 12.48 1 7.02 1 3 5.02 3 9.5s4.02 8.5 9.48 8.5c2.96 0 5.12-1.02 6.88-2.82 1.8-1.8 2.34-4.26 2.34-6.32 0-.47-.05-.93-.13-1.38h-9.2z"
        fill="currentColor"
      />
    </svg>
  ),
};
