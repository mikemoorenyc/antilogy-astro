import { handleSchedule } from '@vercel/schedules';
import type { APIRoute } from 'astro';
import { actions } from "astro:actions"
import { badResponse, goodResponse } from '../_lib';






export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization");
  const cronSecret = import.meta.env.CRON_SECRET;

  if (!authHeader || !cronSecret || authHeader !== cronSecret) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }
  try {
    const deleted = await deleteExpiredRecords();
    return goodResponse({})
  } catch (error) {
    console.log(String(error))
    return badResponse("Couldn't delete", 500)

  }
}

async function deleteExpiredRecords() {
  try {
    const { data, error } = await Astro.callAction(actions.media.getUploads, "antilogy/tempFiles/")
    if (error) {
      console.log(String(error));
      throw error;
    }



    const deleted = await Astro.callAction(actions.media.deleteMedia, {
      items: data.map(d => d.public_id),
      publicUser:true
    })
    if (deleted.error) {
      console.log(String(error))
      throw error
    }
    console.log(`Deleted: ${data.map(d=>d.public_id).join(", ")}`)
  } catch (error) {
    console.log(String(error))

  }

}
