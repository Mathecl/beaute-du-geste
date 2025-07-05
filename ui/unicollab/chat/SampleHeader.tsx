export default function SampleHeader(props: {
  sampleName: string;
  sampleIcon: string;
  sampleDocsLink: string;
}) {
  return (
    <div className="flex w-[752px] flex-row items-center justify-between gap-6">
      <div className="flex w-[480px] flex-row items-center justify-start gap-6">
        <div className="from-29% to-134% flex h-16 flex-row items-center justify-center rounded-xl border bg-gradient-to-br from-[rgba(255,255,255,1)] to-[rgba(248,250,252,1)] pb-3 pl-3 pr-3 pt-3">
          <div className="flex h-10 flex-col items-center justify-center">
            <img
              width="37.9px"
              height="31.3px"
              src={'/assets/' + props.sampleIcon}
              alt={props.sampleName}
            />
          </div>
        </div>
        <div className="font-manrope min-w-[152px] whitespace-nowrap text-[18px] font-medium leading-6 text-black text-opacity-100">
          {props.sampleName}
        </div>
      </div>
      <div className="flex h-5 w-[84px] items-center justify-between gap-1 overflow-hidden rounded-md">
        <a href={props.sampleDocsLink} target="_blank">
          <div className="font-manrope min-w-[64px] whitespace-nowrap text-sm font-medium leading-5 text-sky-600 text-opacity-100">
            View docs
          </div>
        </a>
        <a href={props.sampleDocsLink} target="_blank">
          <div className="flex h-4 w-4 flex-col items-center justify-center">
            <img
              width="10.3px"
              height="7.2px"
              src="/assets/ExploreNow.svg"
              alt="Explore Now"
            />
          </div>
        </a>
      </div>
    </div>
  );
}
