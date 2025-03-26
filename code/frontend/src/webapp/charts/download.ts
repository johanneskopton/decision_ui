const renderCanvasToDataUrl = (canvas: HTMLCanvasElement | null, format: string, color: string) => {
  if (canvas == null) {
    return "";
  }
  const ctx = canvas.getContext("2d");
  if (ctx == null) {
    return "";
  }

  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const data = canvas.toDataURL(format, 0.9);
  ctx.restore();

  return data;
};

export const downloadChart = (
  redraw: (device_pixel_ratio: number) => HTMLCanvasElement | null,
  filename: string,
  filetype: string,
  device_pixel_ratio: number = 2.0
) => {
  const formats: { [filetype: string]: string } = {
    jpg: "image/jpeg",
    png: "image/png"
  };

  const backgrounds: { [filetype: string]: string } = {
    jpg: "#ffffff",
    png: "transparent"
  };

  const canvas = redraw(device_pixel_ratio);
  const link = document.createElement("a");
  link.href = renderCanvasToDataUrl(canvas, formats[filetype], backgrounds[filetype]);
  link.download = `${filename}.${filetype}`;
  link.click();
  redraw(1.0);
};
