"use client";

import { buildMessengerUrl } from "@/lib/order-requests";

export default function ContactActions({
  facebookProfileUrl,
  messengerUsername,
  phone,
}: {
  facebookProfileUrl: string | null;
  messengerUsername: string | null;
  phone: string;
}) {
  const messengerUrl = buildMessengerUrl(messengerUsername);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {facebookProfileUrl && <a className="border border-sky-400/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-sky-300 transition-colors hover:bg-sky-400 hover:text-black" href={facebookProfileUrl} target="_blank" rel="noreferrer">Open Facebook Profile</a>}
      {messengerUrl && <a className="border border-[#d7ff3f]/40 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#d7ff3f] transition-colors hover:bg-[#d7ff3f] hover:text-black" href={messengerUrl} target="_blank" rel="noreferrer">Open Messenger</a>}
      <button className="border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 transition-colors hover:border-white/60 hover:text-white" type="button" onClick={() => copy(phone)}>Copy Phone</button>
      {messengerUsername && <button className="border border-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 transition-colors hover:border-white/60 hover:text-white" type="button" onClick={() => copy(messengerUsername)}>Copy Username</button>}
    </div>
  );
}
