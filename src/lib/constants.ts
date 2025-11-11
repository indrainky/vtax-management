/**
 * Contract status colors mapping
 */
export const statusColors = {
  Draft: "bg-gray-500",
  Review: "bg-yellow-500",
  ACC: "bg-green-500",
  Pencairan: "bg-blue-500",
  "Bukti Potongan Pajak": "bg-purple-500",
} as const;

/**
 * Contract status type
 */
export type ContractStatus = keyof typeof statusColors;

