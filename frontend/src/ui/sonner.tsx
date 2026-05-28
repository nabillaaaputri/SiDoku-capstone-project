import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-slate-200 group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:shadow-[0_18px_40px_rgba(15,23,42,0.12)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:rounded-xl group-[.toast]:bg-slate-900 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:rounded-xl group-[.toast]:bg-slate-100 group-[.toast]:text-slate-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
