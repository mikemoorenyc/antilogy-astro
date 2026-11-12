import { handleSchedule } from '@vercel/schedules';
import { actions } from "astro:actions"


export const POST = handleSchedule(async (metadata) => {
  console.log(
    `Running ${metadata.name}, scheduled for ${metadata.scheduledAt.toISOString()}`,
  );

  await deleteExpiredRecords();
});

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
