interface CustomButtonProps {
  label: React.ReactNode;
  className?: string;
  onClick?: () => void;
  loading?: boolean; // Add the loading prop
  disabled?: boolean; // Add the disabled prop
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  className,
  loading,
  disabled,
}) => {
  return (
    <div
      onClick={!loading && !disabled ? onClick : undefined} // Prevent clicks when loading or disabled
      className={` w-full py-4 bg-blue-500 hover:bg-blue-700 text-white text-center rounded-xl transition cursor-pointer ${className} ${
        loading || disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? (
        <div className="spinner mx-auto"></div> // Add spinner class here
      ) : (
        label
      )}
    </div>
  );
};

export default CustomButton;
