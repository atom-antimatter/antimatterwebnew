import { GoArrowUpRight } from "react-icons/go";
import styles from "./css/WorkBox.module.css";
import TransitionLink from "./TransitionLink";

export interface WorkListProps {
  number?: string;
  title: string;
  workType: string;
  link: string;
  active?: boolean;
}

type WorkBoxProps = WorkListProps & React.ComponentProps<"a">;

const WorkBox = ({
  number,
  title,
  workType,
  link,
  active,
  ...props
}: WorkBoxProps) => {
  return (
    <TransitionLink
      href={link}
      className={`py-7 px-3 border-b border-foreground/20 duration-200 ${
        active && "bg-foreground/5"
      } ${styles.box}`}
      {...props}
    >
      <div className={`flex justify-between relative `}>
        <div className="flex gap-4 sm:gap-10">
          <div className="text-lg">{number}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div
          className={`text-foreground/40 text-sm sm:text-base max-w-20 sm:max-w-max duration-300 ${styles.work}`}
        >
          {workType}
        </div>
        <GoArrowUpRight
          className={`size-7 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 duration-200 ${styles.icon}`}
        />
      </div>
    </TransitionLink>
  );
};

export default WorkBox;
