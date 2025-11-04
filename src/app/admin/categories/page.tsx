'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Edit, GripVertical, Plus } from 'lucide-react'

interface Category {
  _id: string
  name: string
  image: string
  subcategories: string[]
  isActive: boolean
  order: number
}

interface CategoriesResponse {
  success: boolean
  categories: Category[]
}

interface CategoryFormState {
  name: string
  image: string
  subcategories: string
  isActive: boolean
  order: number
}

const emptyForm: CategoryFormState = {
  name: '',
  image: '',
  subcategories: '',
  isActive: true,
  order: 0
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormState>({ ...emptyForm })

  useEffect(() => {
    void fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = (await response.json()) as CategoriesResponse

      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories)
      } else {
        console.error('Unexpected categories payload:', data)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching categories:', error.message)
      } else {
        console.error('Error fetching categories:', error)
      }
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const subcategoriesArray = formData.subcategories
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)

    try {
      const response = await fetch('/api/admin/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
          subcategories: subcategoriesArray,
          isActive: formData.isActive,
          order: formData.order,
          ...(editingCategory ? { id: editingCategory._id } : {})
        })
      })

      if (response.ok) {
        await fetchCategories()
        resetForm()
        alert(editingCategory ? 'Category updated!' : 'Category created!')
      } else {
        const payload = await response.json().catch(() => ({}))
        alert(
          typeof payload.error === 'string'
            ? payload.error
            : 'Failed to save category. Please try again.'
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error saving category: ${error.message}`)
      } else {
        alert('Error saving category')
      }
    }
  }

  const resetForm = () => {
    setFormData({ ...emptyForm })
    setEditingCategory(null)
    setShowForm(false)
  }

  const onFormChange = (event: ChangeEvent<HTMLFormElement['elements'][number]>) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    const { name, value } = target

    setFormData((prev) => {
      if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        return {
          ...prev,
          [name]: target.checked
        } as CategoryFormState
      }

      if (name === 'order') {
        return {
          ...prev,
          order: Number.parseInt(value, 10) || 0
        }
      }

      return {
        ...prev,
        [name]: value
      }
    })
  }

  const editCategory = (category: Category) => {
    setFormData({
      name: category.name,
      image: category.image,
      subcategories: category.subcategories.join(', '),
      isActive: category.isActive,
      order: category.order
    })
    setEditingCategory(category)
    setShowForm(true)
  }

  const moveCategory = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return
    }

    const nextCategories = [...categories]
    const [moved] = nextCategories.splice(fromIndex, 1)

    if (!moved) {
      return
    }

    nextCategories.splice(toIndex, 0, moved)

    const updated = nextCategories.map((category, index) => ({
      ...category,
      order: index + 1
    }))

    setCategories(updated)

    try {
      await Promise.all(
        updated.map((category) =>
          fetch('/api/admin/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: category._id, order: category.order })
          })
        )
      )
      await fetchCategories()
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating category order:', error.message)
      } else {
        console.error('Error updating category order:', error)
      }
      await fetchCategories()
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={onFormChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subcategories (comma separated)</label>
              <input
                type="text"
                name="subcategories"
                value={formData.subcategories}
                onChange={onFormChange}
                className="w-full p-2 border rounded"
                placeholder="Mobile Cases, Screen Protectors, Chargers"
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={onFormChange}
                  className="w-20 p-2 border rounded"
                />
              </div>
              <label className="flex items-center gap-2 mt-6 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={onFormChange}
                />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Categories ({categories.length})</h2>
        </div>
        <div className="divide-y">
          {categories.map((category, index) => (
            <div key={category._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <button
                  className="cursor-move p-1 text-gray-400 hover:text-gray-600"
                  onClick={() => moveCategory(index, index > 0 ? index - 1 : 0)}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-600">
                    Subcategories: {category.subcategories.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">Order: {category.order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveCategory(index, Math.max(0, index - 1))}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    disabled={index === 0}
                  >
                    UP
                  </button>
                  <button
                    onClick={() => moveCategory(index, Math.min(categories.length - 1, index + 1))}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    disabled={index === categories.length - 1}
                  >
                    DN
                  </button>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => editCategory(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
