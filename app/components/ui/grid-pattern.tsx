import { cn } from '~/lib/utils';

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeDasharray?: string;
  className?: string;
}

export const GridPattern = ({
  width = 40,
  height = 40,
  strokeDasharray = '0',
  className,
  ...props
}: GridPatternProps) => {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 h-full w-full fill-neutral-400/30 stroke-neutral-400/30',
        className,
      )}
      {...props}
    >
      <defs>
        <pattern id="grid-pattern" width={width} height={height} patternUnits="userSpaceOnUse">
          <path d={`M ${width} 0 L 0 0 0 ${height}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};



