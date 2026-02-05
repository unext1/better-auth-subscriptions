import { Link } from 'react-router';
import { buttonVariants } from '~/components/ui/button';

const Index = () => {
  return (
    <div className="p-6 flex-1 flex flex-col justify-center items-center h-screen">
      <Link to="/login" className={buttonVariants()}>
        Sign In
      </Link>
    </div>
  );
};

export default Index;
