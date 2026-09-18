import type { Category, CategoryType } from "@/types/category";

type CategorySelectProps = {
  categories: Category[];
  type: CategoryType;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  required?: boolean;
};

export function CategorySelect({ categories, type, value, onChange, name = "categoryId", required }: CategorySelectProps) {
  const label = type === "income" ? "income" : "expense";

  return (
    <label className="category-select">
      <span>{label} category</span>
      <select name={name} value={value} onChange={(event) => onChange?.(event.target.value)} required={required}>
        <option value="">Choose a category</option>
        {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
      </select>
    </label>
  );
}
