import { useForm } from "react-hook-form";

export default function ScanForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 bg-card p-6 rounded-xl shadow-md border border-gray-800"
    >
      {/* Target Domain/IP */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          Target Domain / IP
        </label>
        <input
          type="text"
          {...register("target", { required: "Target is required" })}
          placeholder="e.g. example.com"
          className="w-full p-3 rounded-lg bg-background border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {errors.target && (
          <p className="text-red-400 text-sm mt-1">{errors.target.message}</p>
        )}
      </div>

      {/* Scan Type */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-300">
          Scan Type
        </label>
        <select
          {...register("scanType", { required: true })}
          className="w-full p-3 rounded-lg bg-background border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="quick">Quick Scan</option>
          <option value="deep">Deep Scan</option>
          <option value="custom">Custom Scan</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-500 transition-all shadow"
      >
        🚀 Start Scan
      </button>
    </form>
  );
}
