"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-card !text-card-foreground !border !border-border !shadow-lg !rounded-lg !p-4",
          title: "!text-foreground !font-semibold !text-base",
          description: "!text-muted-foreground !text-sm",
          actionButton:
            "!bg-accent !text-accent-foreground hover:!opacity-90 !rounded-md !px-4 !py-2 !font-medium !text-sm",
          cancelButton:
            "!bg-muted/80 hover:!bg-muted !text-muted-foreground !border !border-border !rounded-md !px-4 !py-2 !font-medium !text-sm",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
