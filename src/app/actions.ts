'use server';

import { parseJobDescriptionIntoTasks } from '@/ai/flows/job-details-task-parsing';
import { z } from 'zod';

const schema = z.object({
  jobDescription: z.string().min(1, 'Job description cannot be empty.'),
});

export type FormState = {
  message: string;
  tasks?: string[];
  fields?: Record<string, string>;
};

export async function getTasksFromDescription(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    jobDescription: formData.get('jobDescription'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation error.',
      fields: {
        jobDescription: validatedFields.error.flatten().fieldErrors.jobDescription?.[0] ?? '',
      },
    };
  }

  try {
    const result = await parseJobDescriptionIntoTasks(validatedFields.data);
    if (result.tasks && result.tasks.length > 0) {
      return { message: 'success', tasks: result.tasks };
    }
    return { message: 'Could not generate tasks from the description.' };
  } catch (e) {
    return { message: 'An error occurred while communicating with the AI.' };
  }
}
