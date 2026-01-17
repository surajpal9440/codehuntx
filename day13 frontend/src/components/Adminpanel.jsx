import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router'; // 💡 Recommended to use 'react-router-dom'
import { useSelector } from 'react-redux'; // 🚩 FIX: Import useSelector to get user ID

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),

  // 🚩 FIX 1: Changed to 'Difficulty' (Capital D) to match Mongoose schema
  Difficulty: z.enum(['easy', 'medium', 'hard']),

  // 🚩 FIX 2: Check backend tags Enum. Mongoose schema was ['array', 'linkedlist', 'grap', 'tree', 'dp']
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),

  // 🚩 FIX 3: Changed to 'visibilityTestCases' to match Mongoose field name
  visibilityTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),

      // 🚩 New Fields per test case
      image: z.string().optional(),
      target: z.string().optional(),

      // 🚩 FIX 4: Changed to 'explaination' (spelling in Mongoose schema)
      explaination: z.string().optional() // Made optional
    })
  ).min(1, 'At least one visible test case required'),

  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),

  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),

  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  // 🚩 Get user data
  const { user } = useSelector((state) => state.auth);

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue, // Added setValue
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      // 🚩 Ensure default values for selects match the new field names
      Difficulty: 'easy',
      tags: 'array',
      startCode: [
        { language: 'C++', initialCode: "" },
        { language: 'Java', initialCode: "" },
        { language: 'JavaScript', initialCode: "" }
      ],
      referenceSolution: [
        {
          language: 'C++',
          completeCode: ""
        },
        {
          language: 'Java',
          completeCode: ""
        },
        {
          language: 'JavaScript',
          completeCode: ""
        }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    // 🚩 FIX 3: Changed to 'visibilityTestCases'
    name: 'visibilityTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get signature (using 'new' as problemId for temp uploads)
      const signatureResponse = await axiosClient.get(`/video/create/new`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);
      // Ensure resource_type is valid (auto or image)
      // formData.append('resource_type', 'image'); 

      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, // Changed to image/upload
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      // 3. Set URL
      const secureUrl = uploadResponse.data.secure_url;
      setImageUrl(secureUrl);
      setValue('image', secureUrl); // Update form data

    } catch (error) {
      console.error("Image Upload Error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    // 🚩 FIX 5: Add the required problemCreator field
    const payload = {
      ...data,
      problemCreator: user?._id // Use optional chaining just in case
    };

    try {
      await axiosClient.post('/problem/create', payload);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      console.error("Submission Error:", error);
      const errorMessage = error.response?.data || error.response?.data?.message || error.message;
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                {...register('title')}
                className={`input input-bordered ${errors.title && 'input-error'}`}
              />
              {errors.title && (
                <span className="text-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                {...register('description')}
                className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`}
              />
              {errors.description && (
                <span className="text-error">{errors.description.message}</span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Difficulty</span>
                </label>
                <select
                  // 🚩 FIX 1: Registering 'Difficulty' (Capital D)
                  {...register('Difficulty')}
                  className={`select select-bordered ${errors.Difficulty && 'select-error'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {/* 🚩 FIX 1: Checking errors.Difficulty */}
                {errors.Difficulty && (
                  <span className="text-error">{errors.Difficulty.message}</span>
                )}
              </div>

              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Tag</span>
                </label>
                <select
                  {...register('tags')}
                  className={`select select-bordered ${errors.tags && 'select-error'}`}
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                </select>
                {errors.tags && (
                  <span className="text-error">{errors.tags.message}</span>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>

          {/* Visible Test Cases */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visible Test Cases</h3>
              <button
                type="button"
                // 🚩 FIX 4: Changed append field name to 'explaination'
                onClick={() => appendVisible({ input: '', output: '', explaination: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Visible Case
              </button>
            </div>

            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>

                <input
                  // 🚩 FIX 3: Registering under 'visibilityTestCases'
                  {...register(`visibilityTestCases.${index}.input`)}
                  placeholder='Input (e.g. "")'
                  className="input input-bordered w-full"
                />

                <input
                  // 🚩 FIX 3: Registering under 'visibilityTestCases'
                  {...register(`visibilityTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />

                <input
                  {...register(`visibilityTestCases.${index}.target`)}
                  placeholder="Target (Optional)"
                  className="input input-bordered w-full"
                />

                <div className="form-control">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index)}
                    disabled={uploading}
                    className="file-input file-input-bordered w-full"
                  />
                  {/* Preview Image if exists in form state */}
                  {field.image && (
                    <div className="mt-2">
                      <p className="text-success text-sm">Image Uploaded!</p>
                      <img src={field.image} alt="Uploaded" className="h-24 w-auto object-contain mt-1 border rounded" />
                    </div>
                  )}
                  {/* Hidden input to store URL */}
                  <input type="hidden" {...register(`visibilityTestCases.${index}.image`)} />
                </div>

                <textarea
                  // 🚩 FIX 4: Registering 'explaination'
                  {...register(`visibilityTestCases.${index}.explaination`)}
                  placeholder="Explanation (Optional)"
                  className="textarea textarea-bordered w-full"
                />
                {/* Check for nested errors if required */}
                {/* {errors.visibilityTestCases?.[index]?.explaination && (
                    <span className="text-error">{errors.visibilityTestCases[index].explaination.message}</span>
                )} */}
              </div>
            ))}
            {/* Display error for minimum array length */}
            {errors.visibilityTestCases && typeof errors.visibilityTestCases.message === 'string' && (
              <span className="text-error">{errors.visibilityTestCases.message}</span>
            )}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-sm btn-primary"
              >
                Add Hidden Case
              </button>
            </div>

            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(`hiddenTestCases.${index}.input`)}
                  placeholder='Input (e.g. "")'
                  className="input input-bordered w-full"
                />

                <input
                  {...register(`hiddenTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
            {errors.hiddenTestCases && typeof errors.hiddenTestCases.message === 'string' && (
              <span className="text-error">{errors.hiddenTestCases.message}</span>
            )}
          </div>
        </div>

        {/* Code Templates - No changes needed here, names are correct */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>

          <div className="space-y-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">
                  {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                </h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Code</span>
                  </label>
                  <pre className="bg-base-300 p-4 rounded-lg">
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      className="w-full bg-transparent font-mono"
                      rows={6}
                    />
                  </pre>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reference Solution</span>
                  </label>
                  <pre className="bg-base-300 p-4 rounded-lg">
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      className="w-full bg-transparent font-mono"
                      rows={6}
                    />
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;