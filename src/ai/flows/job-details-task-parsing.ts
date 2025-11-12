'use server';

/**
 * @fileOverview Parses a job description into a list of actionable tasks.
 *
 * - parseJobDescriptionIntoTasks - A function that parses a job description into tasks.
 * - ParseJobDescriptionIntoTasksInput - The input type for the parseJobDescriptionIntoTasks function.
 * - ParseJobDescriptionIntoTasksOutput - The return type for the parseJobDescriptionIntoTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseJobDescriptionIntoTasksInputSchema = z.object({
  jobDescription: z.string().describe('The description of the job.'),
});
export type ParseJobDescriptionIntoTasksInput = z.infer<
  typeof ParseJobDescriptionIntoTasksInputSchema
>;

const ParseJobDescriptionIntoTasksOutputSchema = z.object({
  tasks: z
    .array(z.string())
    .describe('A list of actionable tasks parsed from the job description.'),
});
export type ParseJobDescriptionIntoTasksOutput = z.infer<
  typeof ParseJobDescriptionIntoTasksOutputSchema
>;

export async function parseJobDescriptionIntoTasks(
  input: ParseJobDescriptionIntoTasksInput
): Promise<ParseJobDescriptionIntoTasksOutput> {
  return parseJobDescriptionIntoTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseJobDescriptionIntoTasksPrompt',
  input: {schema: ParseJobDescriptionIntoTasksInputSchema},
  output: {schema: ParseJobDescriptionIntoTasksOutputSchema},
  prompt: `You are a project manager assistant. Your task is to parse the given job description into a list of actionable tasks.

Job Description: {{{jobDescription}}}

Tasks:`,
});

const parseJobDescriptionIntoTasksFlow = ai.defineFlow(
  {
    name: 'parseJobDescriptionIntoTasksFlow',
    inputSchema: ParseJobDescriptionIntoTasksInputSchema,
    outputSchema: ParseJobDescriptionIntoTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
