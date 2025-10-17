import { GoArrowUpRight } from "react-icons/go";
import styles from "./css/NavButton.module.css";
import TransitionLink from "./TransitionLink";

const NavButton = ({ ...props }: React.ComponentProps<"a">) => {
  return (
    <TransitionLink href="/contact" scroll onClick={props.onClick} {...props}>
      <div
        className={`border border-foreground/40 font-medium bg-background/20 backdrop-blur-xl cursor-pointer p-0.5 lg:p-1 h-10 lg:h-12 rounded-full ${styles.button} hover:scale-105 duration-300 text-sm font-extralight`}
      >
        <div className="relative pl-3 lg:pl-5 pr-18 flex items-center  h-full">
          <span className="-mt-0.5">Start Your Project</span>
          <div
            className={`bg-foreground max-w-12 lg:max-w-14 h-full rounded-full text-background flex
          items-center justify-center ${styles.iconBox}`}
          >
            <GoArrowUpRight className={`size-6 lg:size-7 ${styles.icon}`} />
          </div>
        </div>
      </div>
    </TransitionLink>
  );
};

export default NavButton;
