import { GoArrowUpRight } from "react-icons/go";
import { MdOutlineDesignServices } from "react-icons/md";
import { FaCode, FaMobileAlt } from "react-icons/fa";
import { FaBrain } from "react-icons/fa6";
import { BsGraphUpArrow } from "react-icons/bs";
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

// Map tag names to icons
const getTagIcon = (tag: string) => {
  const tagLower = tag.toLowerCase();
  if (tagLower.includes('web design')) return <MdOutlineDesignServices className="size-3" />;
  if (tagLower.includes('app design')) return <FaMobileAlt className="size-3" />;
  if (tagLower.includes('development')) return <FaCode className="size-3" />;
  if (tagLower.includes('ai')) return <FaBrain className="size-3" />;
  if (tagLower.includes('gtm')) return <BsGraphUpArrow className="size-3" />;
  return null;
};

const WorkBox = ({
  number,
  title,
  workType,
  link,
  active,
  ...props
}: WorkBoxProps) => {
  const tags = workType.split(',').map(tag => tag.trim());
  
  return (
    <TransitionLink
      href={link}
      className={`py-7 px-3 border-b border-foreground/20 duration-200 ${
        active && "bg-foreground/5"
      } ${styles.box}`}
      {...props}
    >
      <div className={`flex flex-col gap-3`}>
        <div className={`flex justify-between relative`}>
          <div className="flex gap-4 sm:gap-10 items-center">
            <div className="text-lg">{number}</div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <GoArrowUpRight
            className={`size-7 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 duration-200 ${styles.icon}`}
          />
        </div>
        <div className="hidden sm:flex gap-2 flex-wrap ml-14">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-foreground/20 bg-foreground/5 text-foreground/60 text-xs"
            >
              {getTagIcon(tag)}
              <span>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </TransitionLink>
  );
};

export default WorkBox;
