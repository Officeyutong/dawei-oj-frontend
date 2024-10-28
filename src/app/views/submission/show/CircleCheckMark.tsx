import { useRef, useEffect } from 'react';

const CircleCheckMark = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current !== null) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const circleRadius = 50;
      const checkmarkShortLength = 30;
      const checkmarkLongLength = 70;
      if (ctx !== null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let progress = 0;

        const drawAnimation = () => {
          progress += 0.06;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.beginPath();
          ctx.arc(canvas.width / 2 + canvas.width / 18, canvas.height / 2 + canvas.height / 24, circleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#90EE90';
          ctx.lineWidth = 5;
          ctx.stroke();


          if (progress > 0.5) {
            const startX = canvas.width / 2 - checkmarkShortLength / 3;
            const startY = canvas.height / 2 + checkmarkShortLength / 4;
            const midX = canvas.width / 2;
            const midY = canvas.height / 2 + checkmarkShortLength;
            const endX = canvas.width / 2 + checkmarkLongLength / 2;
            const endY = canvas.height / 2 - checkmarkLongLength / 4;

            ctx.beginPath();
            ctx.moveTo(startX, startY);

            if (progress < 1) {

              ctx.lineTo(
                startX + (midX - startX) * (progress - 0.5) * 2,
                startY + (midY - startY) * (progress - 0.5) * 2
              );
            } else {
              ctx.lineTo(midX, midY);
              ctx.lineTo(
                midX + (endX - midX) * (progress - 1),
                midY + (endY - midY) * (progress - 1)
              );
            }

            ctx.strokeStyle = '#90EE90';
            ctx.lineWidth = 5;
            ctx.stroke();
          }

          if (progress < 2) {
            requestAnimationFrame(drawAnimation);
          }
        };
        drawAnimation()
      }
    }
  }, []);

  return <canvas ref={canvasRef} width={200} height={200} />;
};

export default CircleCheckMark;