import { useStream } from "./";

export function useImage(id) {
  const [image, { update, request }] = useStream("image", id);
  const updateImage = u => {
    request("update-image", (id, u)).then(v => update(u));
  };

  return { image, updateImage };
}
