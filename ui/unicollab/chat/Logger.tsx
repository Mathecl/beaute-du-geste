import React from 'react';

export class LogEntry {
  public timestamp: Date;
  public message: string;

  constructor(message: string) {
    this.timestamp = new Date();
    this.message = message;
  }
}

export type LoggingProps = {
  logEntries: Array<LogEntry>;
  displayHeader: boolean;
};

export default function Logger({ logEntries, displayHeader }: LoggingProps) {
  return (
    <div className="flex flex-col items-start justify-start gap-4">
      {displayHeader && (
        <div className="font-manrope min-w-[108px] whitespace-nowrap text-sm font-medium uppercase leading-4 tracking-widest text-black text-opacity-100">
          <span className="uppercase">Message log</span>
        </div>
      )}
      <div className="flex flex-col items-start justify-start rounded-lg bg-gray-900">
        <div className="flex h-10 w-[752px] flex-row items-center justify-start border-b border-solid border-slate-800 pb-3 pl-2 pr-2 pt-3">
          <div className="flex h-7 flex-row items-start justify-start gap-1.5 pb-2.5 pl-2.5 pr-2.5 pt-2.5">
            <img
              width="10px"
              height="10px"
              src="/assets/RedButton.svg"
              alt="Red"
            />
            <img
              width="10px"
              height="10px"
              src="/assets/YellowButton.svg"
              alt="Yellow"
            />
            <img
              width="10px"
              height="10px"
              src="/assets/GreenButton.svg"
              alt="Green"
            />
          </div>
        </div>

        <div className="scrollbar-thumb-slate-500 scrollbar-track-black-100 scrollbar flex max-h-60 w-[752px] flex-col-reverse items-start justify-start gap-4 overflow-x-hidden overflow-y-scroll pb-6 pl-6 pr-6 pt-6">
          <div className="font-jetbrains-mono text-sm  font-medium leading-normal text-rose-400 text-opacity-100">
            <ul>
              {
                // Show the newest log entry at the top
                logEntries.map((logEntry: LogEntry, index: number) => {
                  return (
                    <li key={index}>
                      <span className="font-jetbrains-mono min-w-[20px] whitespace-nowrap text-sm font-medium leading-normal text-slate-500 text-opacity-100">
                        {index + 1}
                      </span>
                      &nbsp;&nbsp;{logEntry.message}
                    </li>
                  );
                })
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
