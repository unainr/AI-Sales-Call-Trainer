import { z } from "zod"
export const formSchema = z.object({
 productName: z.string().min(2, "Product name must be at least 2 characters"),
  industry:    z.string().min(1, "Please select an industry"),
  difficulty:  z.string().min(1, "Please select a difficulty"),
  yourRole:    z.string().min(1, "Please select your role"),
  callGoal:    z.string().min(1, "Please select a call goal"),
  persona:     z.string().min(1, "Please select a persona"),
})
