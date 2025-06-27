import Image from "@tiptap/extension-image"

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-align": {
        default: "center",
      },
    }
  },
}) 