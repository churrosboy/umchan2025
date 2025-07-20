import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sellers } from '../data/sellers';

const SellerAuth = () => {
    const { userId } = useParams();
    const user = sellers.find(u => u.id === Number(userId));
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div style={styles.wrapper}>
        <div style={styles.container}>
            <div style={styles.header}>
            <div style={styles.backButton}><span onClick={goBack}>←</span></div>
            <div style={styles.headerTitle}>판매자 인증정보</div>
            <div style={{ width: 18 }} />
            </div>
            <div style={styles.scrollArea}>
            <div style={styles.section}>
                <div style={styles.infoBox}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ fontSize: 30, marginRight: 12 }}>🧑‍🍳</div>
                    <div>
                    <div style={styles.sectionTitle}>{user.name} 님의 판매자 인증정보</div>
                    <div style={{ fontSize: 14, color: '#666' }}>
                        사업자 인증<br />위생점검
                    </div>
                    </div>
                </div>
                </div>
            </div>
            <div style={{ ...styles.infoBox, fontSize: 13, color: '#444' }}>
                먼저 방문해서 확인했어요.<br />
                정기 위생 교육을 이수했어요.<br />
                실제 등록된 사업자로 인증했어요.<br />
                공용 공간이 아닌 별도 주방이에요.
            </div>
            </div>
        </div>
        </div>
    );
};

const styles = {
    wrapper: {
        minHeight: '100vh',
        background: '#fff',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        fontWeight: 'bold',
        fontSize: 16,
        borderBottom: '1px solid #ddd',
        position: 'relative',
    },
    backButton: {
        cursor: 'pointer',
        fontSize: 18,
        color: '#333',
    },
    headerTitle: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontWeight: 'bold',
    },
    scrollArea: {
        flex: 1,
        overflowY: 'auto',
        padding: 20,
        paddingBottom: 80,
    },
    section: {
        padding: 0,
        borderBottom: 'none',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 8,
    },
    infoBox: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
};

export default SellerAuth;