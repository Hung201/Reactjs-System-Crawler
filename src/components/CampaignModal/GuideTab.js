import React from 'react';
import { ExternalLink, MousePointer, Copy } from 'lucide-react';
import BookmarkletCode from '../Common/BookmarkletCode';

const GuideTab = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Hướng dẫn sử dụng Element Selector
                </h3>
                <p className="text-gray-600 mb-6">
                    Sử dụng bookmarklet để lấy CSS selector từ trang web một cách dễ dàng và chính xác.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                    <ExternalLink size={20} className="text-blue-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="text-md font-semibold text-blue-800 mb-3">
                            Các bước thực hiện:
                        </h4>
                        <ol className="list-decimal list-inside space-y-3 text-sm text-blue-800">
                            <li>
                                <strong>Mở trang web:</strong> Mở trang web chi tiết sản phẩm bạn muốn lấy selector trong tab mới của trình duyệt
                            </li>
                            <li>
                                <strong>Mở bookmark:</strong> Ấn tổ hợp phím ctrl + shift + O để mở bookmark rồi bấm vào "Dấu trang khác". Bấm vào 3 chấm bên phải của bookmarklet để mở menu rồi tạo dấu trang mới. Hiện ra đầu vào là "Tên" bạn điền tên tùy bạn và "URL" thì bạn dán code ở bước dưới vào.
                            </li>
                            <li>
                                <strong>Tạo bookmarklet:</strong> Kéo đoạn code sau vào thanh bookmark của trình duyệt:
                                <div className="mt-2 ml-4">
                                    <BookmarkletCode />
                                </div>
                            </li>
                            <li>
                                <strong>Chọn element:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                    <li>Mở lại trang web chi tiết sản phẩm bạn muốn lấy selector</li>
                                    <li>Nhấn tổ hợp phím ctrl + shift + B rồi chọn Bookmark vừa tạo</li>
                                    <li>Di chuyển chuột qua các element để highlight (viền đỏ)</li>
                                    <li>Click vào element bạn muốn lấy class path</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Lấy kết quả:</strong> Kết quả sẽ hiển thị selector 3 cấp trong hộp thoại
                            </li>
                            <li>
                                <strong>Copy và paste:</strong> Copy selector và paste vào ô input tương ứng trong tab "Input Schema"
                            </li>
                            <li>
                                <strong>Hủy bỏ:</strong> Nhấn ESC để hủy bỏ nếu cần
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                    <MousePointer size={20} className="text-yellow-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="text-md font-semibold text-yellow-800 mb-3">
                            Lưu ý quan trọng:
                        </h4>
                        <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800">
                            <li>Selector 3 cấp giúp tránh trùng lặp và chính xác hơn</li>
                            <li>Đảm bảo bookmarklet được tạo đúng cách trước khi sử dụng</li>
                            <li>Có thể sử dụng bookmarklet trên bất kỳ trang web nào</li>
                            <li>Nếu không thấy highlight, hãy thử refresh trang và click lại bookmarklet</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                    <Copy size={20} className="text-gray-600 mt-1" />
                    <div className="flex-1">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">
                            Cách sử dụng selector:
                        </h4>
                        <div className="text-sm text-gray-700 space-y-2">
                            <p>
                                Sau khi có selector, bạn có thể sử dụng trong:
                            </p>
                            <ul className="list-disc list-inside ml-4 space-y-1">
                                <li><strong>CSS:</strong> <code className="bg-white px-1 rounded">.your-selector {'{'} color: red; {'}'}</code></li>
                                <li><strong>JavaScript:</strong> <code className="bg-white px-1 rounded">document.querySelector('.your-selector')</code></li>
                                <li><strong>Web scraping:</strong> Để trích xuất dữ liệu từ trang web</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideTab;
