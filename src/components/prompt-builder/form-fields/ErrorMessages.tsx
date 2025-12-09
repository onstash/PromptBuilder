import { motion } from "motion/react";

type FormError = string | { message: string };

export function ErrorMessages({ errors }: { errors: FormError[] }) {
  if (!errors || errors.length === 0) return null;

  return (
    <>
      {errors.map((error) => (
        <motion.div
          key={typeof error === "string" ? error : error.message}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-destructive">
            {typeof error === "string" ? error : error.message}
          </p>
        </motion.div>
      ))}
    </>
  );
}
